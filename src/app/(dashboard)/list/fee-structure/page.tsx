import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

const FeeStructureListPage = async ({
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
      header: "Amount",
      accessor: "amount",
    },
    {
      header: "Type",
      accessor: "feeType",
    },
    {
      header: "Grade",
      accessor: "grade",
      className: "hidden md:table-cell",
    },
    {
      header: "Academic Year",
      accessor: "academicYear",
      className: "hidden md:table-cell",
    },
    {
      header: "Due Date",
      accessor: "dueDate",
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
      <td>{item.amount}</td>
      <td>
        <span className={`px-2 py-1 rounded-full text-xs ${
          item.feeType === 'TUITION' ? 'bg-blue-100 text-blue-800' :
          item.feeType === 'TRANSPORTATION' ? 'bg-purple-100 text-purple-800' :
          item.feeType === 'EXAMINATION' ? 'bg-yellow-100 text-yellow-800' :
          item.feeType === 'LIBRARY' ? 'bg-green-100 text-green-800' :
          item.feeType === 'LABORATORY' ? 'bg-orange-100 text-orange-800' :
          item.feeType === 'SPORTS' ? 'bg-indigo-100 text-indigo-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {item.feeTypeLabel}
        </span>
      </td>
      <td className="hidden md:table-cell">{item.grade}</td>
      <td className="hidden md:table-cell">{item.academicYear}</td>
      <td className="hidden md:table-cell">{item.dueDate}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="feeStructure" type="update" data={item} />
              <FormContainer table="feeStructure" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  const query: Prisma.FeeStructureWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "gradeId":
            query.gradeId = parseInt(value);
            break;
          case "feeType":
            query.feeType = value;
            break;
          case "academicYear":
            query.academicYear = value;
            break;
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              { description: { contains: value, mode: "insensitive" } },
              { feeType: { contains: value, mode: "insensitive" } },
              { academicYear: { contains: value, mode: "insensitive" } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  const [feeStructuresData, count] = await prisma.$transaction([
    prisma.feeStructure.findMany({
      where: query,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: [
        { academicYear: 'desc' },
        { name: 'asc' }
      ],
      include: {
        grade: true,
        _count: {
          select: {
            payments: true,
          },
        },
      },
    }),
    prisma.feeStructure.count({ where: query }),
  ]);

  // Format date in a readable way
  const formatDate = (date: Date | undefined | null) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get label from fee type
  const getFeeTypeLabel = (type: string) => {
    const feeType = FEE_TYPES.find(ft => ft.value === type);
    return feeType ? feeType.label : type;
  };

  // Common fee types for display/filtering
  const FEE_TYPES = [
    { value: "TUITION", label: "Tuition Fee" },
    { value: "TRANSPORTATION", label: "Transportation Fee" },
    { value: "EXAMINATION", label: "Examination Fee" },
    { value: "LIBRARY", label: "Library Fee" },
    { value: "LABORATORY", label: "Laboratory Fee" },
    { value: "SPORTS", label: "Sports Fee" },
    { value: "MISCELLANEOUS", label: "Miscellaneous Fee" },
  ];

  // Transform the data to include formatted information
  const data = feeStructuresData.map(fee => ({
    id: fee.id,
    name: fee.name,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(fee.amount),
    rawAmount: fee.amount,
    description: fee.description,
    dueDate: formatDate(fee.dueDate),
    rawDueDate: fee.dueDate,
    feeType: fee.feeType,
    feeTypeLabel: getFeeTypeLabel(fee.feeType),
    academicYear: fee.academicYear || "Not specified",
    grade: fee.grade ? `Grade ${fee.grade.level}` : "All Grades",
    gradeId: fee.gradeId,
    paymentsCount: fee._count.payments,
  }));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Fee Structure</h1>
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
              <FormContainer table="feeStructure" type="create" />
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

export default FeeStructureListPage;
