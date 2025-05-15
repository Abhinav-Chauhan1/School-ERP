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

const ExpenseListPage = async ({
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
      header: "Amount",
      accessor: "formattedAmount",
    },
    {
      header: "Date",
      accessor: "formattedDate",
      className: "hidden md:table-cell",
    },
    {
      header: "Category",
      accessor: "category",
      className: "hidden md:table-cell",
    },
    {
      header: "Approved By",
      accessor: "approvedBy",
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
      <td className="p-4">{item.formattedAmount}</td>
      <td className="hidden md:table-cell p-4">{item.formattedDate}</td>
      <td className="hidden md:table-cell p-4">
        <span className={`px-2 py-1 rounded-full text-xs text-white ${
          item.category === 'Supplies' ? 'bg-blue-500' : 
          item.category === 'Maintenance' ? 'bg-yellow-500' : 
          item.category === 'Utilities' ? 'bg-green-500' : 
          item.category === 'Salary' ? 'bg-purple-500' : 
          item.category === 'Transportation' ? 'bg-orange-500' : 
          item.category === 'Events' ? 'bg-pink-500' : 
          item.category === 'Equipment' ? 'bg-teal-500' : 
          item.category === 'Software' ? 'bg-indigo-500' : 'bg-gray-500'
        }`}>
          {item.category}
        </span>
      </td>
      <td className="hidden md:table-cell p-4">{item.approvedBy || "-"}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="expense" type="update" data={item} />
              <FormContainer table="expense" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  const query: Prisma.ExpenseWhereInput = {};

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
          case "minAmount":
            query.amount = { gte: parseFloat(value) };
            break;
          case "maxAmount":
            query.amount = { ...(query.amount as any), lte: parseFloat(value) };
            break;
          default:
            break;
        }
      }
    }
  }

  const [expensesData, count] = await prisma.$transaction([
    prisma.expense.findMany({
      where: query,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: { date: 'desc' },
    }),
    prisma.expense.count({ where: query }),
  ]);

  // Transform the data to include formatted information
  const data = expensesData.map(expense => ({
    id: expense.id,
    title: expense.title,
    amount: expense.amount,
    formattedAmount: formatCurrency(expense.amount),
    date: expense.date,
    formattedDate: formatDateTime(expense.date),
    category: expense.category,
    description: expense.description,
    receipt: expense.receipt,
    approvedBy: expense.approvedBy,
  }));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Expenses</h1>
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
              <FormContainer table="expense" type="create" />
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

export default ExpenseListPage;
