'use client';

import useActiveChannel from "../hooks/useActiveChannel";

const ActiveStatus = () => {
  useActiveChannel(); // This is the hook that we are going to create in the next step to update the active channel in the database. 

  return null;
}
 
export default ActiveStatus;
