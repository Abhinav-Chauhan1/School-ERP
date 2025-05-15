import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { formatDateTime, formatCurrency } from "@/lib/utils";

const BudgetListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    {
      header: "Title",
      accessor: "title",
    },
    {
      header: "Total Amount",
      accessor: "formattedTotalAmount",
    },
    {
      header: "Utilized",
      accessor: "formattedUtilizedAmount",
      className: "hidden md:table-cell",
    },
    {
      header: "Allocation Date",
      accessor: "formattedAllocatedDate",
      className: "hidden md:table-cell",
    },
    {
      header: "Category",
      accessor: "category",
      className: "hidden md:table-cell",
    },
    {
      header: "Progress",
      accessor: "progress",
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
      <td className="p-4">{item.formattedTotalAmount}</td>
      <td className="hidden md:table-cell p-4">{item.formattedUtilizedAmount}</td>
      <td className="hidden md:table-cell p-4">{item.formattedAllocatedDate}</td>
      <td className="hidden md:table-cell p-4">
        <span className={`px-2 py-1 rounded-full text-xs text-white ${
          item.category === 'Operations' ? 'bg-blue-500' : 
          item.category === 'Infrastructure' ? 'bg-purple-500' : 
          item.category === 'Academics' ? 'bg-green-500' : 
          item.category === 'Transportation' ? 'bg-yellow-500' : 
          item.category === 'Technology' ? 'bg-indigo-500' : 
          item.category === 'Events' ? 'bg-pink-500' : 
          item.category === 'Staff' ? 'bg-orange-500' : 
          item.category === 'Maintenance' ? 'bg-teal-500' : 'bg-gray-500'
        }`}>
          {item.category}
        </span>
      </td>
      <td className="p-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
          <div 
            className={`h-2.5 rounded-full ${
              item.utilizationPercentage > 90 ? 'bg-red-500' : 
              item.utilizationPercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
            }`} 
            style={{ width: `${Math.min(100, item.utilizationPercentage)}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-600">{item.utilizationPercentage}%</div>
      </td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="budget" type="update" data={item} />
              <FormContainer table="budget" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  const query: Prisma.BudgetWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.title = { contains: value, mode: "insensitive" };
            break;
          case "category":
            query.category = value;
            break;
          default:
            break;
        }
      }
    }
  }

  const [budgetsData, count] = await prisma.$transaction([
    prisma.budget.findMany({
      where: query,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { allocatedDate: 'desc' },
    }),
    prisma.budget.count({ where: query }),
  ]);

  // Transform the data to include formatted information
  const data = budgetsData.map(budget => {
    const utilizationPercentage = budget.totalAmount > 0 
      ? Math.round((budget.utilizedAmount / budget.totalAmount) * 100) 
      : 0;
    
    return {
      id: budget.id,
      title: budget.title,
      totalAmount: budget.totalAmount,
      formattedTotalAmount: formatCurrency(budget.totalAmount),
      utilizedAmount: budget.utilizedAmount,
      formattedUtilizedAmount: formatCurrency(budget.utilizedAmount),
      allocatedDate: budget.allocatedDate,
      formattedAllocatedDate: formatDateTime(budget.allocatedDate),
      endDate: budget.endDate,
      formattedEndDate: budget.endDate ? formatDateTime(budget.endDate) : '-',
      description: budget.description,
      category: budget.category,
      utilizationPercentage,
    };
  });

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Budget Management</h1>
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
              <FormContainer table="budget" type="create" />
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

export default BudgetListPage;
