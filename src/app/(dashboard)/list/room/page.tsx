import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

const RoomListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Type",
      accessor: "type",
      className: "hidden md:table-cell",
    },
    {
      header: "Capacity",
      accessor: "capacity",
      className: "hidden md:table-cell",
    },
    {
      header: "Location",
      accessor: "location",
      className: "hidden md:table-cell",
    },
    {
      header: "Status",
      accessor: "status",
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
      <td className="hidden md:table-cell p-4">{item.type}</td>
      <td className="hidden md:table-cell p-4">{item.capacity}</td>
      <td className="hidden md:table-cell p-4">{item.location || "-"}</td>
      <td className="hidden md:table-cell p-4">
        <span className={`px-2 py-1 rounded-full text-xs text-white ${item.available ? 'bg-green-500' : 'bg-red-500'}`}>
          {item.available ? 'Available' : 'Occupied'}
        </span>
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="room" type="update" data={item} />
              <FormContainer table="room" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  const query: Prisma.RoomWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.name = { contains: value, mode: "insensitive" };
            break;
          case "type":
            query.type = { equals: value };
            break;
          case "available":
            query.available = value === "true";
            break;
          default:
            break;
        }
      }
    }
  }

  const [roomsData, count] = await prisma.$transaction([
    prisma.room.findMany({
      where: query,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            classes: true,
            lessons: true,
            events: true,
          },
        },
      },
    }),
    prisma.room.count({ where: query }),
  ]);

  // Transform the data to include formatted information
  const data = roomsData.map(room => ({
    id: room.id,
    name: room.name,
    type: room.type,
    capacity: room.capacity,
    location: room.location,
    available: room.available,
    classCount: room._count.classes,
    lessonCount: room._count.lessons,
    eventCount: room._count.events,
  }));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Rooms</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && (
              <FormContainer table="room" type="create" />
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

export default RoomListPage;
