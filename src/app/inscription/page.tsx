import { SignUpForm } from "@/components/auth/signup-form";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";

import { signUpAction } from "./actions";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f3f5f9] text-[#103b67]">
      <PublicHeader currentPath="/inscription" />

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mt-10 flex flex-col items-center">
            <h1 className="max-w-3xl text-center text-5xl font-semibold leading-tight tracking-tight text-[#113b67] sm:text-6xl">
              Creez votre compte
            </h1>

            <div className="mt-12 w-full max-w-xl">
              <SignUpForm action={signUpAction} />
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
