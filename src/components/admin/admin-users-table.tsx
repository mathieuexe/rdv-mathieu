"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, ChevronRight } from "lucide-react";

import { formatPhone } from "@/lib/utils";
import type { UserProfileRecord } from "@/types/domain";

interface AdminUsersTableProps {
  users: UserProfileRecord[];
}

export function AdminUsersTable({ users }: AdminUsersTableProps) {
  const [query, setQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return users;
    }

    return users.filter((user) =>
      `${user.firstName} ${user.lastName} ${user.email} ${user.phone ?? ""}`.toLowerCase().includes(normalizedQuery),
    );
  }, [query, users]);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="block w-full max-w-md">
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <Search className="size-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher (nom, email, téléphone)..."
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
        </label>
        <span className="text-xs font-medium text-slate-500">{filteredUsers.length} résultat(s)</span>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-slate-500">
          Aucun utilisateur ne correspond à votre recherche.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid min-w-[800px] grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_160px_60px] border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <div>Utilisateur</div>
            <div>Contact</div>
            <div>Statut</div>
            <div className="text-right">Action</div>
          </div>

          <div className="min-w-[800px] divide-y divide-slate-100">
            {filteredUsers.map((user) => (
              <div key={user.userId} className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_160px_60px] items-center px-5 py-3 text-sm hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-semibold text-slate-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{user.role}</p>
                </div>

                <div className="min-w-0 pr-4">
                  <p className="truncate text-slate-700">{user.email}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{formatPhone(user.phone) || "N/A"}</p>
                </div>

                <div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.requiresPasswordChange
                        ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                        : "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                    }`}
                  >
                    {user.requiresPasswordChange ? "Mdp requis" : "Normal"}
                  </span>
                </div>

                <div className="flex justify-end">
                  <Link
                    href={`/admin/utilisateurs/${user.userId}`}
                    className="inline-flex rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-900"
                    title="Voir le dossier"
                  >
                    <ChevronRight className="size-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
