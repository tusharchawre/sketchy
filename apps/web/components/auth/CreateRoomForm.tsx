"use client"
import { useForm } from "react-hook-form"
import {z} from "zod"
import { CreateRoomSchema, LoginSchema, RegisterSchema} from "@repo/common/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useTransition } from "react"

import { useRouter } from "next/navigation"


export function CreateRoomForm() {

    const router = useRouter()

    const [isPending , startTransition] = useTransition()

    const form = useForm<z.infer<typeof CreateRoomSchema>>({
        resolver: zodResolver(CreateRoomSchema),
        defaultValues: {
            roomName: ""
        }
    })

    const token = JSON.stringify(localStorage.getItem('token'))

        const onSubmit =  (values : z.infer<typeof CreateRoomSchema>) => {
            
        }
    

    



  return (
    <Card className="w-full max-w-md">
        <CardHeader>
            <CardTitle className="w-full text-center">
                Enter the room name
            </CardTitle>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField 
                    control={form.control} 
                    name="roomName"
                    render = {({field})=>(
                        <FormItem>
                            <FormLabel>Room Name</FormLabel>
                            <FormControl>
                                <Input disabled={isPending} placeholder="Enter Room Name" type="text" {...field} />
                            </FormControl>
                            <FormMessage />
                            <FormDescription>
                                This is your public display room name.
                            </FormDescription>
                        </FormItem>
                    )}
                    />

                
                <Button type="submit" disabled={isPending} className="w-full mt-4">
                    Create Room
                </Button>
                </form>

            </Form>
        </CardContent>
    </Card>
  )
}

