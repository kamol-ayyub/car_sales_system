import { useGetAllQuery } from "@repo/api";

export const App = () => {
  const { data } = useGetAllQuery({
    url: "car",
  });
  if (data) console.log("all cars", data.data);
  return <h1>Admin Dashboard</h1>;
};
