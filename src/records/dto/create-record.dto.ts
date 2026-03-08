import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { LoanType } from '../../common/enums/loan-type.enum';

export class CreateRecordDto {
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsString()
  @IsNotEmpty()
  mobile: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsEnum(LoanType)
  loanType: LoanType;

  @IsNumber()
  @Min(0)
  loanAmount: number;
}
