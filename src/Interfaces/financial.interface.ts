import { Schema } from "mongoose";

export interface ITransaction {
  name: string;
  amount: number;
  type: string;
  image?: string;
  date: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: Schema.Types.ObjectId;
  category: string;
  status?: string;
}
