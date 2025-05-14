import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

const ClassListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    {
      header: "Class Name",
      accessor: "name",
    },
    {
      header: "Capacity",
      accessor: "capacity",
      className: "hidden md:table-cell",
    },
    {
      header: "Grade",
      accessor: "grade",
      className: "hidden md:table-cell",
    },
    {
      header: "Supervisor",
      accessor: "supervisor",
      className: "hidden md:table-cell",
    },
    {
      header: "Academic Year",
      accessor: "academicYear",
      className: "hidden md:table-cell",
    },
    {
      header: "Sections",
      accessor: "sectionCount",
      className: "hidden md:table-cell",
    },
    {
      header: "Students",
      accessor: "studentCount",
      className: "hidden lg:table-cell",
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
      <td className="hidden md:table-cell p-4">{item.capacity}</td>
      <td className="hidden md:table-cell p-4">Grade {item.gradeLevel}</td>
      <td className="hidden md:table-cell p-4">{item.supervisorName || "-"}</td>
      <td className="hidden md:table-cell p-4">{item.academicYearName || "-"}</td>
      <td className="hidden md:table-cell p-4">{item.sectionCount}</td>
      <td className="hidden lg:table-cell p-4">{item.studentCount}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer 
                table="class" 
                type="update" 
                data={item} 
                relatedData={{
                  teachers,
                  grades,
                  academicYears
                }}
              />
              <FormContainer table="class" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  const query: Prisma.ClassWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "supervisorId":
            query.supervisorId = value;
            break;
          case "gradeId":
            query.gradeId = parseInt(value);
            break;
          case "academicYearId":
            query.academicYearId = parseInt(value);
            break;
          case "search":
            query.name = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  // Get related data for the form dropdowns
  const [teachers, grades, academicYears] = await Promise.all([
    prisma.teacher.findMany({
      select: {
        id: true,
        name: true,
        surname: true,
      },
      orderBy: { name: 'asc' },
    }),
    prisma.grade.findMany({
      orderBy: { level: 'asc' },
    }),
    prisma.academicYear.findMany({
      orderBy: { name: 'asc' },
    }),
  ]);

  const [classesData, count] = await prisma.$transaction([
    prisma.class.findMany({
      where: query,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { name: 'asc' },
      include: {
        supervisor: {
          select: {
            name: true,
            surname: true,
          },
        },
        grade: {
          select: {
            level: true,
          },
        },
        academicYear: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            sections: true,
            students: true,
          },
        },
      },
    }),
    prisma.class.count({ where: query }),
  ]);

  // Transform the data to display in the table
  const data = classesData.map(cls => ({
    id: cls.id,
    name: cls.name,
    capacity: cls.capacity,
    supervisorId: cls.supervisorId,
    supervisorName: cls.supervisor ? `${cls.supervisor.name} ${cls.supervisor.surname}` : null,
    gradeId: cls.gradeId,
    gradeLevel: cls.grade.level,
    academicYearId: cls.academicYearId,
    academicYearName: cls.academicYear?.name || null,
    sectionCount: cls._count.sections,
    studentCount: cls._count.students,
  }));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Classes</h1>
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
              <FormContainer 
                table="class" 
                type="create" 
                relatedData={{
                  teachers,
                  grades,
                  academicYears
                }}
              />
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

export default ClassListPage;
