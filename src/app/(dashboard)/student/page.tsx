import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendar from "@/components/EventCalendar";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const StudentPage = async () => {
  const { userId } = auth();

  // Get student with class and section information
  const student = await prisma.student.findUnique({
    where: { id: userId! },
    include: {
      class: true,
      section: true,
      grade: true,
      parent: true,
    },
  });

  if (!student) {
    return <div>Student information not found</div>;
  }

  // Format status for display
  const statusColorMap = {
    ACTIVE: "text-green-600",
    SUSPENDED: "text-yellow-600",
    ARCHIVED: "text-red-600",
  };

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">
            Schedule ({student.class.name}
            {student.section ? ` - ${student.section.name}` : ""})
          </h1>
          <BigCalendarContainer type="classId" id={student.classId} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Student Information</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Name:</div>
            <div>{student.name} {student.surname}</div>
            <div>Status:</div>
            <div className={statusColorMap[student.status as keyof typeof statusColorMap]}>
              {student.status}
            </div>
            <div>Grade:</div>
            <div>{student.grade.level}</div>
            <div>Class:</div>
            <div>{student.class.name}</div>
            {student.section && (
              <>
                <div>Section:</div>
                <div>{student.section.name}</div>
              </>
            )}
            <div>Parent:</div>
            <div>{student.parent.name} {student.parent.surname}</div>
          </div>
        </div>
        <EventCalendar />
        <Announcements />
      </div>
    </div>
  );
};

export default StudentPage;
