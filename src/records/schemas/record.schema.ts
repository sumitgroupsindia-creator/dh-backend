import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { LoanType } from '../../common/enums/loan-type.enum';
import { RecordStatus } from '../../common/enums/status.enum';

export type RecordDocument = Record & Document;

@Schema({ timestamps: true })
export class Record {
  @Prop({ required: true })
  clientName: string;

  @Prop({ required: true })
  mobile: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true, enum: LoanType })
  loanType: LoanType;

  @Prop({ required: true })
  loanAmount: number;

  @Prop({ required: true, enum: RecordStatus, default: RecordStatus.PENDING })
  status: RecordStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const RecordSchema = SchemaFactory.createForClass(Record);
