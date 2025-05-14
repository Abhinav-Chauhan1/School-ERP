import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import Image from "next/image";

const TeacherPage = async () => {
  const { userId } = auth();
  
  // Fetch teacher data including related department and academic year
  const teacher = userId ? await prisma.teacher.findUnique({
    where: { id: userId },
    include: {
      department: true,
      academicYear: true,
      subjects: true,
    }
  }) : null;

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Schedule</h1>
          <BigCalendarContainer type="teacherId" id={userId!} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        {/* Teacher Profile Card */}
        {teacher && (
          <div className="bg-white p-4 rounded-md shadow-sm">
            <h2 className="text-xl font-semibold mb-4">My Profile</h2>
            <div className="flex flex-col items-center mb-4">
              <Image 
                src={teacher.img || "/noAvatar.png"} 
                alt={`${teacher.name} ${teacher.surname}`}
                width={100}
                height={100}
                className="rounded-full object-cover"
              />
              <h3 className="text-lg font-medium mt-2">{teacher.name} {teacher.surname}</h3>
              <p className="text-sm text-gray-500">Teacher</p>
            </div>

            <div className="space-y-2">
              {teacher.department && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Department:</span>
                  <span className="text-sm text-gray-600">{teacher.department.name}</span>
                </div>
              )}
              {teacher.academicYear && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Academic Year:</span>
                  <span className="text-sm text-gray-600">{teacher.academicYear.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm text-gray-600">{teacher.email || "Not provided"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Phone:</span>
                <span className="text-sm text-gray-600">{teacher.phone || "Not provided"}</span>
              </div>
              
              {teacher.subjects.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Subjects:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {teacher.subjects.map((subject) => (
                      <span 
                        key={subject.id}
                        className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded"
                      >
                        {subject.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <Announcements />
      </div>
    </div>
  );
};

export default TeacherPage;
