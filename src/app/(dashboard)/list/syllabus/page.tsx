import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

const SyllabusListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    {
      header: "Subject",
      accessor: "subject",
    },
    {
      header: "Description",
      accessor: "description",
      className: "hidden md:table-cell",
    },
    {
      header: "Completion",
      accessor: "completion",
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
      <td className="p-4">{item.subject}</td>
      <td className="hidden md:table-cell p-4">
        {item.description || 'No description'}
      </td>
      <td className="hidden md:table-cell p-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-green-600 h-2.5 rounded-full" 
            style={{ width: `${item.completion}%` }}
          ></div>
        </div>
        <span className="text-xs ml-1">{item.completion}%</span>
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" || role === "teacher" ? (
            <>
              <FormContainer table="syllabus" type="update" data={item} />
              <FormContainer table="syllabus" type="delete" id={item.id} />
            </>
          ) : null}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  const query: Prisma.SyllabusWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.OR = [
              { description: { contains: value, mode: "insensitive" } },
              { subject: { name: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  const [syllabiData, count] = await prisma.$transaction([
    prisma.syllabus.findMany({
      where: query,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { subject: { name: 'asc' } },
      include: {
        subject: true,
      },
    }),
    prisma.syllabus.count({ where: query }),
  ]);

  // Transform the data to include formatted information
  const data = syllabiData.map(syllabus => ({
    id: syllabus.id,
    subject: syllabus.subject.name,
    subjectId: syllabus.subjectId,
    content: syllabus.content,
    description: syllabus.description,
    completion: syllabus.completion,
  }));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Syllabus</h1>
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
              <FormContainer table="syllabus" type="create" />
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

export default SyllabusListPage;
