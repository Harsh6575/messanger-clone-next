"use client";
import React, { useCallback, useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { BsGithub } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { toast } from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";

import Button from "@/app/components/Button";
import Input from "@/app/components/inputs/Input";
import AuthSocialButton from "./AuthSocialButton";
import { useRouter } from "next/navigation";
import { sign } from "crypto";

type Variant = "LOGIN" | "REGISTER"; // making a type for the variant state to make it easier to read and use in the component below

const AuthForm = () => {
  const session = useSession();

  const router = useRouter();

  const [variant, setVariant] = useState<Variant>("LOGIN"); // setting the variant state to LOGIN as the default state

  const [isLoading, setIsLoading] = useState(false); // setting the isLoading state to false as the default state

  useEffect(() => {
    if (session?.status === "authenticated") {
      // toast.success('Logged in successfully');
      // console.log('authenticated');
      router.push("/users");
    }
  }, [session?.status, router]); // using useEffect to check if the session state changes

  const toggleVariant = useCallback(() => {
    setVariant(variant === "LOGIN" ? "REGISTER" : "LOGIN");
  }, [variant]); // using useCallback to memoize the toggleVariant function to prevent unnecessary re-renders of the component when the variant state changes

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  }); // using react-hook-form to handle the form state and validation

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true); // setting the isLoading state to true when the form is submitted

    if (variant === "REGISTER") {
      // axios register
      axios
        .post("/api/register", data)
        .then(()=> signIn("credentials", data))
        .catch(() => {
          toast.error("Something went wrong");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } // if the variant state is REGISTER, then the user is trying to register a new account, so we will make a request to the backend to register the user

    if (variant === "LOGIN") {
      // nextauth signin
      signIn("credentials", {
        ...data,
        redirect: false,
      })
        .then((callback) => {
          if (callback?.error) {
            toast.error("Invalid credentials");
          }

          if (callback?.ok && !callback?.error) {
            toast.success("Logged in successfully"); 
            router.push("/users");
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } // if the variant state is LOGIN, then the user is trying to login to their account, so we will make a request to the backend to login the user
  }; // using the onSubmit function to handle the form submission

  const socialAction = (action: string) => {
    setIsLoading(true); // setting the isLoading state to true when the social button is clicked

    // nextauth socail signin

    signIn(action, {
      redirect: false,
    })
      .then((callback) => {
        if (callback?.error) {
          toast.error("Something went wrong");
        }

        if (callback?.ok && !callback?.error) {
          toast.success("Logged in successfully");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }; // using the socialAction function to handle the social signin

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {variant === "REGISTER" && (
            <Input
              disabled={isLoading}
              register={register}
              errors={errors}
              // required
              id="name"
              label="Name"
            />
            // if the variant state is REGISTER, then we will render the name input field
          )}
          <Input
            disabled={isLoading}
            register={register}
            errors={errors}
            // required
            id="email"
            label="Email Address"
            type="email"
          />
          <Input
            disabled={isLoading}
            register={register}
            errors={errors}
            // required
            id="password"
            label="Password"
            type="password"
          />
          <div>
            <Button disabled={isLoading} fullWidth type="submit">
              {variant === "LOGIN" ? "Sign in" : "Register"}
            </Button>
            {/* 
                // if the variant state is LOGIN, then we will render the login button or else we will render the register button 
             */}
          </div>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <AuthSocialButton
              icon={BsGithub}
              onClick={() => socialAction("github")}
            />
            <AuthSocialButton
              icon={FcGoogle}
              onClick={() => socialAction("google")}
            />
          </div>
        </div>
        <div className="flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500">
          <div>
            {variant === "LOGIN"
              ? "New to Messenger?"
              : "Already have an account?"}
            {/* 
                // if the variant state is LOGIN, then we will render the "New to Messenger?" text or else we will render the "Already have an account?" text 

              */}
          </div>
          <div onClick={toggleVariant} className="underline cursor-pointer">
            {variant === "LOGIN" ? "Create an account" : "Login"}
            {/*
                // if the variant state is LOGIN, then we will render the "Create an account" text or else we will render the "Login" text
            */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
