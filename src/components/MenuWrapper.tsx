import { currentUser } from "@clerk/nextjs/server";
import Menu from "./Menu";
import { ClerkProvider } from "@clerk/nextjs";

const MenuWrapper = async () => {
  // Fetch the user on the server side
  await currentUser();
  
  return (
    <Menu />
  );
};

export default MenuWrapper;
