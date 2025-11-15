import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";

export default async function Handler(props: { params: Promise<{ stack: string[] }>; searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  return <StackHandler fullPage app={stackServerApp} params={params} searchParams={searchParams} />;
}
