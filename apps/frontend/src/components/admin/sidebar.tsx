import Link from 'next/link'
import { Home, Users, BookOpen, FileText,  Settings } from 'lucide-react'

export function Sidebar() {
  return (
    <div className="w-64 bg-yellow-500 text-white p-6">
      <h1 className="text-2xl font-bold mb-8">Exam Platform Admin</h1>
      <nav>
        <ul className="space-y-4">
          <li>
            <Link href="/admin" className="flex items-center space-x-2 hover:text-yellow-200">
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/users" className="hidden items-center space-x-2 hover:text-yellow-200">
              <Users className="h-5 w-5" />
              <span>Users</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/questions" className="flex items-center space-x-2 hover:text-yellow-200">
              <BookOpen className="h-5 w-5" />
              <span>Questions</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/tests" className="flex items-center space-x-2 hover:text-yellow-200">
              <FileText className="h-5 w-5" />
              <span>Tests</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/settings" className="hidden items-center space-x-2 hover:text-yellow-200">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}

