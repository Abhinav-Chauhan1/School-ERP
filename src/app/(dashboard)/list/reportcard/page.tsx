import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

const ReportCardListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const columns = [
    {
      header: "Student",
      accessor: "student",
    },
    {
      header: "Term",
      accessor: "term",
    },
    {
      header: "Grade",
      accessor: "grade",
    },
    {
      header: "Percentage",
      accessor: "percentage",
      className: "hidden md:table-cell",
    },
    {
      header: "Total Marks",
      accessor: "totalMarks",
      className: "hidden md:table-cell",
    },
    {
      header: "Issue Date",
      accessor: "issueDate",
      className: "hidden md:table-cell",
    },
    {
      header: "Actions",
      accessor: "action",
    },
  ];

  const renderRow = (item: any) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">{item.student}</td>
      <td>{item.term}</td>
      <td className="font-semibold">
        <span className={`px-2 py-1 rounded-full text-xs ${
          item.grade === 'A+' || item.grade === 'A' ? 'bg-green-100 text-green-800' :
          item.grade === 'B' ? 'bg-blue-100 text-blue-800' :
          item.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
          item.grade === 'D' ? 'bg-orange-100 text-orange-800' :
          'bg-red-100 text-red-800'
        }`}>
          {item.grade}
        </span>
      </td>
      <td className="hidden md:table-cell">{item.percentage}%</td>
      <td className="hidden md:table-cell">{item.totalMarks}</td>
      <td className="hidden md:table-cell">{item.issueDate}</td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher") && (
            <>
              <FormContainer table="reportCard" type="update" data={item} />
              <FormContainer table="reportCard" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  const query: Prisma.ReportCardWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "termId":
            query.termId = parseInt(value);
            break;
          case "studentId":
            query.studentId = value;
            break;
          case "search":
            query.OR = [
              { student: { name: { contains: value, mode: "insensitive" } } },
              { student: { surname: { contains: value, mode: "insensitive" } } },
              { term: { name: { contains: value, mode: "insensitive" } } },
              { grade: { contains: value, mode: "insensitive" } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // Role-based conditions
  switch (role) {
    case "admin":
    case "teacher":
      // Admin and teachers can see all report cards
      break;
    case "student":
      // Students can only see their own report cards
      query.studentId = currentUserId!;
      break;
    case "parent":
      // Parents can see their children's report cards
      query.student = {
        parentId: currentUserId!
      };
      break;
    default:
      break;
  }

  const [reportCardsData, count] = await prisma.$transaction([
    prisma.reportCard.findMany({
      where: query,
      include: {
        student: true,
        term: {
          include: {
            academicYear: true
          }
        },
        _count: {
          select: {
            results: true
          }
        }
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: [
        { issueDate: 'desc' }
      ],
    }),
    prisma.reportCard.count({ where: query }),
  ]);

  // Format date in a readable way
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Transform the data for display
  const data = reportCardsData.map(reportCard => ({
    id: reportCard.id,
    student: `${reportCard.student.name} ${reportCard.student.surname}`,
    studentId: reportCard.studentId,
    term: `${reportCard.term.name} (${reportCard.term.academicYear.name})`,
    termId: reportCard.termId,
    grade: reportCard.grade,
    percentage: reportCard.percentage,
    totalMarks: reportCard.totalMarks,
    remarks: reportCard.remarks,
    issueDate: formatDate(reportCard.issueDate),
    resultsCount: reportCard._count.results,
  }));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Report Cards</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="reportCard" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ReportCardListPage;
