import CourseStudentsTable from '@/modules/courses/components/CourseStudentsTable'
import React from 'react'

export default function ListStudentsCoursePage() {
  return (
    <main className="flex flex-col w-full min-h-full px-3 lg:px-6 py-12!">
      <CourseStudentsTable />
    </main>
  )
}
