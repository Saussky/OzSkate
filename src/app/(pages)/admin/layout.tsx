export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-center text-4xl font-bold text-gray-800 my-12">
        OzSkate
      </h1>
      {children}
    </div>
  );
}
