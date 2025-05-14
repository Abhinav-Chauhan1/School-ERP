import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

const LessonListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    {
      header: "Lesson Name",
      accessor: "name",
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
      header: "Day",
      accessor: "day",
      className: "hidden md:table-cell",
    },
    {
      header: "Time",
      accessor: "time",
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
      <td className="p-4">{item.name}</td>
      <td>{item.subject}</td>
      <td>{item.class}</td>
      <td className="hidden md:table-cell">{item.day}</td>
      <td className="hidden md:table-cell">{item.time}</td>
      <td className="hidden md:table-cell">{item.teacher}</td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || (role === "teacher" && item.teacherId === sessionClaims?.sub)) && (
            <>
              <FormContainer table="lesson" type="update" data={item} />
              <FormContainer table="lesson" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  const query: Prisma.LessonWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.classId = parseInt(value);
            break;
          case "teacherId":
            query.teacherId = value;
            break;
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              { subject: { name: { contains: value, mode: "insensitive" } } },
              { teacher: { name: { contains: value, mode: "insensitive" } } },
              { class: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  // If user is a teacher, only show their lessons
  if (role === "teacher") {
    query.teacherId = sessionClaims?.sub as string;
  }

  const [lessonsData, count] = await prisma.$transaction([
    prisma.lesson.findMany({
      where: query,
      include: {
        subject: { select: { name: true } },
        class: { select: { name: true } },
        teacher: { select: { name: true, surname: true } },
        room: { select: { name: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: [
        { day: 'asc' },
        { startTime: 'asc' }
      ],
    }),
    prisma.lesson.count({ where: query }),
  ]);

  // Format time in a readable way
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Transform the data to include formatted information
  const data = lessonsData.map(lesson => ({
    id: lesson.id,
    name: lesson.name,
    subject: lesson.subject.name,
    subjectId: lesson.subjectId,
    class: lesson.class.name,
    classId: lesson.classId,
    day: formatDayName(lesson.day),
    time: `${formatTime(lesson.startTime)} - ${formatTime(lesson.endTime)}`,
    startTime: lesson.startTime,
    endTime: lesson.endTime,
    teacher: `${lesson.teacher.name} ${lesson.teacher.surname}`,
    teacherId: lesson.teacherId,
    roomId: lesson.roomId,
    room: lesson.room?.name || "No Room",
  }));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Lessons</h1>
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
              <FormContainer table="lesson" type="create" />
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

// Helper function to format day name
function formatDayName(day: string) {
  const dayMap: { [key: string]: string } = {
    'MONDAY': 'Monday',
    'TUESDAY': 'Tuesday',
    'WEDNESDAY': 'Wednesday',
    'THURSDAY': 'Thursday',
    'FRIDAY': 'Friday',
  };
  return dayMap[day] || day;
}

export default LessonListPage;
