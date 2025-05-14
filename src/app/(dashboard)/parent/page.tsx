import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";
import Link from "next/link";

const ParentPage = async () => {
  const { userId } = auth();
  const currentUserId = userId;
  
  // Get parent with related data
  const parent = await prisma.parent.findUnique({
    where: {
      id: currentUserId!,
    },
    include: {
      students: {
        include: {
          class: true,
          grade: true,
        }
      },
      parentMeetings: {
        where: {
          meetingDate: {
            gte: new Date(),
          },
        },
        include: {
          teacher: true,
        },
        orderBy: {
          meetingDate: 'asc',
        },
        take: 5,
      },
      receivedMsgs: {
        orderBy: {
          sendDate: 'desc',
        },
        take: 5,
        include: {
          teacherSender: true,
          studentSender: true,
          parentSender: true,
        }
      },
    },
  });

  if (!parent) {
    return <div className="flex-1 p-4">Parent not found</div>;
  }

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col">
      {/* PARENT INFO */}
      <div className="bg-white p-4 rounded-md">
        <h1 className="text-2xl font-semibold mb-2">Welcome, {parent.name} {parent.surname}</h1>
        <div className="text-gray-600">
          <p>Email: {parent.email || 'Not set'}</p>
          <p>Phone: {parent.phone}</p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* LEFT SECTION - STUDENT INFO */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Your Children</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parent.students.map((student) => (
                <div key={student.id} className="border p-4 rounded-md">
                  <h3 className="text-lg font-medium">{student.name} {student.surname}</h3>
                  <p className="text-gray-600">Class: {student.class.name}</p>
                  <p className="text-gray-600">Grade: {student.grade.level}</p>
                  <Link href={`/students/${student.id}`} className="text-blue-600 hover:underline text-sm">
                    View details
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* SCHEDULES */}
          {parent.students.map((student) => (
            <div className="bg-white p-4 rounded-md" key={student.id}>
              <h2 className="text-xl font-semibold mb-2">
                {student.name}'s Schedule
              </h2>
              <div className="h-[400px]">
                <BigCalendarContainer type="classId" id={student.classId} />
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT SECTION - MEETINGS, MESSAGES, ANNOUNCEMENTS */}
        <div className="space-y-4">
          {/* UPCOMING MEETINGS */}
          <div className="bg-white p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Upcoming Parent Meetings</h2>
            {parent.parentMeetings.length > 0 ? (
              <div className="space-y-3">
                {parent.parentMeetings.map((meeting) => (
                  <div key={meeting.id} className="border-b pb-2">
                    <p className="font-medium">{meeting.title}</p>
                    <p className="text-sm text-gray-600">
                      With: {meeting.teacher.name} {meeting.teacher.surname}
                    </p>
                    <p className="text-sm text-gray-600">
                      Date: {format(new Date(meeting.meetingDate), 'PPP p')}
                    </p>
                    <p className="text-sm text-gray-600">Status: {meeting.status}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No upcoming meetings</p>
            )}
          </div>

          {/* MESSAGES */}
          <div className="bg-white p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-4">Recent Messages</h2>
            {parent.receivedMsgs.length > 0 ? (
              <div className="space-y-3">
                {parent.receivedMsgs.map((message) => {
                  const sender = message.teacherSender 
                    ? `${message.teacherSender.name} (Teacher)`
                    : message.studentSender
                    ? `${message.studentSender.name} (Student)`
                    : message.parentSender
                    ? `${message.parentSender.name} (Parent)`
                    : 'Unknown';
                    
                  return (
                    <div key={message.id} className={`border-l-4 pl-3 ${message.isRead ? 'border-gray-300' : 'border-blue-500'}`}>
                      <p className="font-medium">{message.subject}</p>
                      <p className="text-sm text-gray-600">From: {sender}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(message.sendDate), 'PP')}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">No messages</p>
            )}
          </div>

          {/* ANNOUNCEMENTS */}
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default ParentPage;
