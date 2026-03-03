import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Calendar,
  ShieldCheck,
  Mail,
  UserPlus
} from 'lucide-react';

export default function UserManagementPage() {
  const users = [
    { id: 'USR-1290', name: 'John Peterson', company: 'Global Construct Ltd', email: 'j.peterson@global-construct.com', role: 'Buyer', status: 'Active', joined: 'Nov 12, 2023' },
    { id: 'USR-1289', name: 'Sarah Schmidt', company: 'Berlin Industrial Gmbh', email: 's.schmidt@berlin-ind.de', role: 'Buyer', status: 'Pending', joined: 'Nov 12, 2023' },
    { id: 'USR-1288', name: 'Marco Rossi', company: 'Madrid Materials SA', email: 'm.rossi@madrid-mat.es', role: 'Buyer', status: 'Active', joined: 'Nov 11, 2023' },
    { id: 'USR-1287', name: 'David Wilson', company: 'Bewama UK', email: 'david.wilson@bewama.com', role: 'Admin', status: 'Active', joined: 'Oct 24, 2023' },
    { id: 'USR-1286', name: 'Elena Dubois', company: 'Paris Build Corp', email: 'e.dubois@paris-build.fr', role: 'Buyer', status: 'Suspended', joined: 'Oct 15, 2023' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-brand-navy tracking-tight">User Management</h1>
          <p className="text-gray-500 mt-2">Manage customer accounts and administrative access.</p>
        </div>
        <div className="flex items-center gap-4">
            <Button className="bg-brand-orange hover:bg-brand-orange-hover text-white rounded-[8px] font-bold h-12 px-8">
                <UserPlus className="mr-2 h-5 w-5" />
                Invite New User
            </Button>
        </div>
      </div>

      {/* User Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-[8px] border-none shadow-sm p-6 text-center space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Users</p>
            <p className="text-3xl font-extrabold text-brand-navy">1,248</p>
        </Card>
        <Card className="rounded-[8px] border-none shadow-sm p-6 text-center space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Buyers</p>
            <p className="text-3xl font-extrabold text-green-600">842</p>
        </Card>
        <Card className="rounded-[8px] border-none shadow-sm p-6 text-center space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pending Verification</p>
            <p className="text-3xl font-extrabold text-yellow-600">12</p>
        </Card>
        <Card className="rounded-[8px] border-none shadow-sm p-6 text-center space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">System Admins</p>
            <p className="text-3xl font-extrabold text-brand-navy">5</p>
        </Card>
      </div>

      {/* User Filters */}
      <Card className="rounded-[8px] border-none shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                    <Input className="pl-10 pr-4 py-2 border border-gray-200 rounded-[8px] w-full" placeholder="Search by name, company, or email..." type="text" />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
                <Button variant="outline" className="flex items-center gap-2 border-gray-200 rounded-[8px]">
                    <ShieldCheck className="h-4 w-4" />
                    <span>User Roles</span>
                </Button>
                <Button variant="outline" className="flex items-center gap-2 border-gray-200 rounded-[8px]">
                    <Filter className="h-4 w-4" />
                    <span>Filter By Status</span>
                </Button>
            </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="rounded-[8px] border-none shadow-sm overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-extrabold text-gray-500 uppercase tracking-wider border-b">
                <tr>
                    <th className="px-8 py-4">User Details</th>
                    <th className="px-8 py-4">Company</th>
                    <th className="px-8 py-4">Role</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Joined Date</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
                {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 cursor-pointer group">
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-brand-navy text-white rounded-full flex items-center justify-center font-bold">
                                    {user.name[0]}
                                </div>
                                <div>
                                    <p className="font-bold text-brand-navy group-hover:text-brand-orange transition-colors">{user.name}</p>
                                    <p className="text-xs text-gray-400">{user.email}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-8 py-6 font-semibold text-gray-600">{user.company}</td>
                        <td className="px-8 py-6">
                            <Badge variant="outline" className={`border-2 font-bold ${
                                user.role === 'Admin' ? 'border-brand-navy text-brand-navy' : 'border-gray-200 text-gray-500'
                            }`}>{user.role}</Badge>
                        </td>
                        <td className="px-8 py-6">
                            <Badge className={`border-none px-3 py-1 flex items-center gap-1 w-fit font-bold ${
                                user.status === 'Active' ? 'bg-green-100 text-green-600' :
                                user.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-red-100 text-red-600'
                            }`}>
                                {user.status === 'Active' ? <CheckCircle2 className="h-3 w-3" /> :
                                 user.status === 'Pending' ? <Clock className="h-3 w-3" /> :
                                 <Trash2 className="h-3 w-3" />}
                                {user.status}
                            </Badge>
                        </td>
                        <td className="px-8 py-6 font-semibold text-gray-600">{user.joined}</td>
                        <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-brand-navy"><Mail className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-brand-orange"><Edit2 className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-brand-navy"><MoreVertical className="h-4 w-4" /></Button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-500">Showing 1 to 5 of 1,248 users</p>
          <div className="flex gap-2">
              <Button variant="outline" disabled className="rounded-[8px]">Previous</Button>
              <Button variant="outline" className="rounded-[8px] hover:bg-brand-navy hover:text-white transition-colors">Next</Button>
          </div>
      </div>
    </div>
  );
}
