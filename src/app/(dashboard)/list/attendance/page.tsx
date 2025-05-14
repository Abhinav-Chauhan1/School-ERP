import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

const AttendanceListPage = async ({
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
      header: "Lesson",
      accessor: "lesson",
    },
    {
      header: "Date",
      accessor: "date",
    },
    {
      header: "Status",
      accessor: "status",
    },
    {
      header: "Class",
      accessor: "class",
      className: "hidden md:table-cell",
    },
    {
      header: "Teacher",
      accessor: "teacher",
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
      <td>{item.lesson}</td>
      <td>{item.date}</td>
      <td>
        {item.present ? (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
            Present
          </span>
        ) : (
          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
            Absent
          </span>
        )}
      </td>
      <td className="hidden md:table-cell">{item.class}</td>
      <td className="hidden md:table-cell">{item.teacher}</td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || (role === "teacher" && item.teacherId === currentUserId)) && (
            <>
              <FormContainer table="attendance" type="update" data={item} />
              <FormContainer table="attendance" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // Prepare query conditions
  const query: Prisma.AttendanceWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "studentId":
            query.studentId = value;
            break;
          case "lessonId":
            query.lessonId = parseInt(value);
            break;
          case "date":
            const date = new Date(value);
            // Create date range for the selected date (full day)
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            
            query.date = {
              gte: startDate,
              lte: endDate
            };
            break;
          case "search":
            query.OR = [
              { student: { name: { contains: value, mode: "insensitive" } } },
              { student: { surname: { contains: value, mode: "insensitive" } } },
              { lesson: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // Role-based filtering
  switch (role) {
    case "admin":
      // Admin can see all attendance records
      break;
    case "teacher":
      // Teachers can only see attendance for their own lessons
      query.lesson = {
        teacherId: currentUserId!
      };
      break;
    case "student":
      // Students can only see their own attendance
      query.studentId = currentUserId!;
      break;
    case "parent":
      // Parents can see attendance for their children
      query.student = {
        parentId: currentUserId!
      };
      break;
    default:
      break;
  }

  const [attendanceData, count] = await prisma.$transaction([
    prisma.attendance.findMany({
      where: query,
      include: {
        student: true,
        lesson: {
          include: {
            subject: true,
            class: true,
            teacher: true,
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: [
        { date: 'desc' },
        { student: { name: 'asc' } }
      ],
    }),
    prisma.attendance.count({ where: query }),
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
  const data = attendanceData.map(record => ({
    id: record.id,
    student: `${record.student.name} ${record.student.surname}`,
    studentId: record.studentId,
    lesson: record.lesson.name,
    lessonId: record.lessonId,
    date: formatDate(record.date),
    rawDate: record.date,
    present: record.present,
    class: record.lesson.class.name,
    teacher: `${record.lesson.teacher.name} ${record.lesson.teacher.surname}`,
    teacherId: record.lesson.teacher.id,
    subject: record.lesson.subject.name,
  }));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Attendance</h1>
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
              <FormContainer table="attendance" type="create" />
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

export default AttendanceListPage;
