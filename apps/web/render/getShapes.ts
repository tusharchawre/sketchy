export const getShapes = async (roomId: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_HTTP_URL}/room/${roomId}`, {
        method: "GET"
    })

    if(res.status === 200){
        const data = await res.json()

        return data.room.shape;
     }

}