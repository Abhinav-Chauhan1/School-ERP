import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { formatDateTime } from "@/lib/utils";

const ParentMeetingListPage = async ({
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
      header: "Parent",
      accessor: "parentName",
      className: "hidden md:table-cell",
    },
    {
      header: "Teacher",
      accessor: "teacherName",
      className: "hidden md:table-cell",
    },
    {
      header: "Meeting Date",
      accessor: "meetingDate",
      className: "hidden md:table-cell",
    },
    {
      header: "Status",
      accessor: "status",
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
      <td className="hidden md:table-cell p-4">{item.parentName}</td>
      <td className="hidden md:table-cell p-4">{item.teacherName}</td>
      <td className="hidden md:table-cell p-4">{item.meetingDate}</td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-xs text-white ${
          item.status === "Scheduled" ? 'bg-yellow-500' : 
          item.status === "Completed" ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {item.status}
        </span>
      </td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || (role === "teacher" && item.teacherId === currentUserId)) && (
            <>
              <FormContainer table="parentMeeting" type="update" data={item} />
              <FormContainer table="parentMeeting" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  const query: Prisma.ParentMeetingWhereInput = {};

  // Apply role-based filtering
  if (role === "teacher") {
    query.teacherId = currentUserId!;
  } else if (role === "parent") {
    query.parentId = currentUserId!;
  }

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.title = { contains: value, mode: "insensitive" };
            break;
          case "status":
            query.status = value;
            break;
          default:
            break;
        }
      }
    }
  }

  const [meetingsData, count] = await prisma.$transaction([
    prisma.parentMeeting.findMany({
      where: query,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { meetingDate: 'desc' },
      include: {
        parent: {
          select: {
            name: true,
            surname: true,
          },
        },
        teacher: {
          select: {
            name: true,
            surname: true,
          },
        },
      },
    }),
    prisma.parentMeeting.count({ where: query }),
  ]);

  // Transform the data to include formatted information
  const data = meetingsData.map(meeting => ({
    id: meeting.id,
    title: meeting.title,
    description: meeting.description,
    meetingDate: formatDateTime(meeting.meetingDate),
    status: meeting.status,
    parentId: meeting.parentId,
    parentName: `${meeting.parent.surname}, ${meeting.parent.name}`,
    teacherId: meeting.teacherId,
    teacherName: `${meeting.teacher.surname}, ${meeting.teacher.name}`,
    feedback: meeting.feedback,
  }));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Parent Meetings</h1>
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
              <FormContainer table="parentMeeting" type="create" />
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

export default ParentMeetingListPage;
