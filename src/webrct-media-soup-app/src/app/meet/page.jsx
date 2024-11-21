import Room from "@/components/Room";
import React from "react";

export default async function MeetPage(props) {
  const searchParams = await props.searchParams;
  console.log(searchParams);
  if (!searchParams?.roomId) {
    return <div> No room id found</div>;
  }
  return <Room roomId={searchParams?.roomId} />;
}
