"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";

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
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_50px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Utilisateurs</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Dossiers clients</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Recherchez un utilisateur puis ouvrez son dossier complet pour modifier ses informations, consulter ses
            rendez-vous, ses logs et ses paramètres.
          </p>
        </div>

        <label className="block w-full max-w-md space-y-2 text-sm font-medium text-slate-700">
          <span>Recherche</span>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
            <Search className="size-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nom, prénom, email ou téléphone"
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
        </label>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center text-sm text-slate-500">
          Aucun utilisateur ne correspond à votre recherche.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
          <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_160px_120px] bg-slate-50 px-5 py-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            <div>Utilisateur</div>
            <div>Contact</div>
            <div>Sécurité</div>
            <div>Action</div>
          </div>

          <div className="divide-y divide-slate-200">
            {filteredUsers.map((user) => (
              <div key={user.userId} className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_160px_120px] items-center px-5 py-4 text-sm">
                <div>
                  <p className="font-semibold text-slate-950">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="mt-1 text-slate-500">{user.role}</p>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-slate-700">{user.email}</p>
                  <p className="mt-1 text-slate-500">{user.phone ?? "Téléphone non renseigné"}</p>
                </div>

                <div>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                      user.requiresPasswordChange
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {user.requiresPasswordChange ? "Mot de passe à changer" : "Accès normal"}
                  </span>
                </div>

                <div>
                  <Link
                    href={`/admin/utilisateurs/${user.userId}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-slate-950 underline underline-offset-4"
                  >
                    <span>Ouvrir</span>
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
