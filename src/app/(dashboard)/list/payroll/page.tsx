import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

const PayrollListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // Only admins should access this page
  if (role !== "admin") {
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <h1 className="text-xl font-semibold text-center my-8">
          You don't have permission to access this page
        </h1>
      </div>
    );
  }

  const columns = [
    {
      header: "Teacher",
      accessor: "teacher",
    },
    {
      header: "Month/Year",
      accessor: "period",
    },
    {
      header: "Gross Amount",
      accessor: "amount",
    },
    {
      header: "Net Salary",
      accessor: "netSalary",
    },
    {
      header: "Tax Deduction",
      accessor: "taxAmount",
      className: "hidden md:table-cell",
    },
    {
      header: "Bonus",
      accessor: "bonusAmount",
      className: "hidden md:table-cell",
    },
    {
      header: "Pay Date",
      accessor: "payDate",
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
      <td className="p-4">{item.teacher}</td>
      <td>{item.period}</td>
      <td>{item.amount}</td>
      <td>{item.netSalary}</td>
      <td className="hidden md:table-cell">{item.taxAmount}</td>
      <td className="hidden md:table-cell">{item.bonusAmount}</td>
      <td className="hidden md:table-cell">{item.payDate}</td>
      <td>
        <div className="flex items-center gap-2">
          <FormContainer table="payroll" type="update" data={item} />
          <FormContainer table="payroll" type="delete" id={item.id} />
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  const query: Prisma.PayrollWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "teacherId":
            query.teacherId = value;
            break;
          case "month":
            query.month = parseInt(value);
            break;
          case "year":
            query.year = parseInt(value);
            break;
          case "search":
            query.OR = [
              { teacher: { name: { contains: value, mode: "insensitive" } } },
              { teacher: { surname: { contains: value, mode: "insensitive" } } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  const [payrollsData, count] = await prisma.$transaction([
    prisma.payroll.findMany({
      where: query,
      include: {
        teacher: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
        { teacher: { surname: 'asc' } }
      ],
    }),
    prisma.payroll.count({ where: query }),
  ]);

  // Format currency values
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date in a readable way
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get month name from month number
  const getMonthName = (month: number) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1];
  };

  // Transform the data for display
  const data = payrollsData.map(payroll => ({
    id: payroll.id,
    teacher: `${payroll.teacher.name} ${payroll.teacher.surname}`,
    teacherId: payroll.teacherId,
    period: `${getMonthName(payroll.month)} ${payroll.year}`,
    month: payroll.month,
    year: payroll.year,
    amount: formatCurrency(payroll.amount),
    rawAmount: payroll.amount,
    taxAmount: formatCurrency(payroll.taxAmount || 0),
    rawTaxAmount: payroll.taxAmount,
    bonusAmount: formatCurrency(payroll.bonusAmount || 0),
    rawBonusAmount: payroll.bonusAmount,
    netSalary: formatCurrency(payroll.netSalary),
    rawNetSalary: payroll.netSalary,
    payDate: formatDate(payroll.payDate),
    rawPayDate: payroll.payDate,
  }));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Payroll</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            <FormContainer table="payroll" type="create" />
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

export default PayrollListPage;
