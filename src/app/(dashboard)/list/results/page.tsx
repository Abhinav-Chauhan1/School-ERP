import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

const ResultListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const columns = [
    {
      header: "Assessment",
      accessor: "title",
    },
    {
      header: "Student",
      accessor: "student",
    },
    {
      header: "Score",
      accessor: "score",
    },
    {
      header: "Total",
      accessor: "totalObtained",
      className: "hidden md:table-cell",
    },
    {
      header: "Status",
      accessor: "status",
      className: "hidden md:table-cell",
    },
    {
      header: "Class",
      accessor: "class",
      className: "hidden md:table-cell",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
    },
    ...(role === "admin" || role === "teacher"
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  const renderRow = (item: any) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4">{item.title}</td>
      <td>{item.student}</td>
      <td>{item.score}</td>
      <td className="hidden md:table-cell">{item.totalObtained}</td>
      <td className="hidden md:table-cell">
        {item.isPassed ? (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
            Passed
          </span>
        ) : (
          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
            Failed
          </span>
        )}
      </td>
      <td className="hidden md:table-cell">{item.class}</td>
      <td className="hidden md:table-cell">{item.date}</td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || (role === "teacher" && item.isTeacher)) && (
            <>
              <FormContainer table="result" type="update" data={item} />
              <FormContainer table="result" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  const query: Prisma.ResultWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "studentId":
            query.studentId = value;
            break;
          case "examId":
            query.examId = parseInt(value);
            break;
          case "assignmentId":
            query.assignmentId = parseInt(value);
            break;
          case "search":
            query.OR = [
              { exam: { title: { contains: value, mode: "insensitive" } } },
              { assignment: { title: { contains: value, mode: "insensitive" } } },
              { student: { name: { contains: value, mode: "insensitive" } } },
              { student: { surname: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS
  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.OR = [
        { exam: { lesson: { teacherId: currentUserId! } } },
        { assignment: { lesson: { teacherId: currentUserId! } } },
      ];
      break;
    case "student":
      query.studentId = currentUserId!;
      break;
    case "parent":
      query.student = {
        parentId: currentUserId!,
      };
      break;
    default:
      break;
  }

  const [resultsData, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: { select: { id: true, name: true, surname: true } },
        exam: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true } },
                teacher: { select: { id: true, name: true, surname: true } },
              },
            },
          },
        },
        assignment: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true } },
                teacher: { select: { id: true, name: true, surname: true } },
              },
            },
          },
        },
        reportCard: { 
          select: { 
            id: true,
            term: { select: { name: true } } 
          } 
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: [
        { examId: 'desc' },
        { assignmentId: 'desc' }
      ],
    }),
    prisma.result.count({ where: query }),
  ]);

  // Format date in a readable way
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Transform the data for the table
  const data = resultsData.map((result) => {
    const assessment = result.exam || result.assignment;
    
    if (!assessment) return null;
    
    const isExam = "startTime" in assessment;
    const teacher = assessment.lesson.teacher;
    const isCurrentTeacher = teacher.id === currentUserId;
    
    return {
      id: result.id,
      title: assessment.title + (isExam ? " (Exam)" : " (Assignment)"),
      student: `${result.student.name} ${result.student.surname}`,
      studentId: result.student.id,
      score: result.score + (result.practicalScore ? ` + ${result.practicalScore} (practical)` : ""),
      totalObtained: result.totalObtained,
      isPassed: result.isPassed,
      class: assessment.lesson.class.name,
      date: formatDate(isExam ? assessment.startTime : assessment.startDate),
      teacher: `${teacher.name} ${teacher.surname}`,
      teacherId: teacher.id,
      isTeacher: isCurrentTeacher,
      examId: result.examId,
      assignmentId: result.assignmentId,
      practicalScore: result.practicalScore,
      grade: result.grade,
      feedbackComments: result.feedbackComments,
      reportCardId: result.reportCardId,
    };
  }).filter(Boolean);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Results</h1>
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
              <FormContainer table="result" type="create" />
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

export default ResultListPage;
