"use server"

import { LoginSchema } from "@repo/common/types"
import { redirect } from "next/navigation"
import { z } from "zod"

export const login = async (values: z.infer<typeof LoginSchema>) => {
    const res = await fetch(`${process.env.HTTP_URL}/signin`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(values)
    })

    if(res.status === 200){
        redirect("/")
       return res.json()
    }
   
    throw new Error("Something Went Wrong")
}