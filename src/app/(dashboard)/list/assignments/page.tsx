import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

const AssignmentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const columns = [
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Subject",
      accessor: "subject",
    },
    {
      header: "Class",
      accessor: "class",
    },
    {
      header: "Start Date",
      accessor: "startDate",
      className: "hidden md:table-cell",
    },
    {
      header: "Due Date",
      accessor: "dueDate",
      className: "hidden md:table-cell",
    },
    {
      header: "Total Marks",
      accessor: "totalMarks",
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
      <td className="p-4">{item.title}</td>
      <td>{item.subject}</td>
      <td>{item.class}</td>
      <td className="hidden md:table-cell">{item.startDate}</td>
      <td className="hidden md:table-cell">{item.dueDate}</td>
      <td className="hidden md:table-cell">{item.totalMarks}</td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || (role === "teacher" && item.teacherId === currentUserId)) && (
            <>
              <FormContainer table="assignment" type="update" data={item} />
              <FormContainer table="assignment" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  const query: Prisma.AssignmentWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "lessonId":
            query.lessonId = parseInt(value);
            break;
          case "search":
            query.OR = [
              { title: { contains: value, mode: "insensitive" } },
              { lesson: { subject: { name: { contains: value, mode: "insensitive" } } } },
              { lesson: { class: { name: { contains: value, mode: "insensitive" } } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS
  if (role === "teacher") {
    query.lesson = {
      teacherId: currentUserId!
    };
  } else if (role === "student") {
    query.lesson = {
      class: {
        students: {
          some: {
            id: currentUserId!,
          },
        },
      },
    };
  } else if (role === "parent") {
    query.lesson = {
      class: {
        students: {
          some: {
            parentId: currentUserId!,
          },
        },
      },
    };
  }

  const [assignmentsData, count] = await prisma.$transaction([
    prisma.assignment.findMany({
      where: query,
      include: {
        lesson: {
          include: {
            subject: true,
            class: true,
            teacher: true,
          },
        },
        _count: {
          select: {
            results: true,
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { dueDate: 'asc' },
    }),
    prisma.assignment.count({ where: query }),
  ]);

  // Format date in a readable way
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Transform the data to include formatted information
  const data = assignmentsData.map(assignment => ({
    id: assignment.id,
    title: assignment.title,
    subject: assignment.lesson.subject.name,
    class: assignment.lesson.class.name,
    teacher: `${assignment.lesson.teacher.name} ${assignment.lesson.teacher.surname}`,
    teacherId: assignment.lesson.teacher.id,
    startDate: formatDate(assignment.startDate),
    dueDate: formatDate(assignment.dueDate),
    lessonId: assignment.lessonId,
    totalMarks: assignment.totalMarks,
    resultsCount: assignment._count.results,
  }));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Assignments</h1>
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
              <FormContainer table="assignment" type="create" />
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

export default AssignmentListPage;
