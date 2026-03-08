import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { RecordsService } from './records.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { QueryRecordDto } from './dto/query-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('records')
@UseGuards(JwtAuthGuard)
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post()
  async create(@Body() createRecordDto: CreateRecordDto, @CurrentUser() user) {
    const record = await this.recordsService.create(createRecordDto, user.id);
    return { message: 'Record created successfully', record };
  }

  @Get()
  async findAll(@Query() query: QueryRecordDto, @CurrentUser() user) {
    return this.recordsService.findAll(query, user);
  }

  @Get('export/csv')
  async exportCsv(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser() user,
    @Res() res: Response,
  ) {
    const records = await this.recordsService.getExportData(user, startDate, endDate);

    const csvHeader = 'Client Name,Mobile,Address,Loan Type,Loan Amount,Status,Created By,Created At\n';
    const csvRows = records
      .map((r: any) => {
        const createdByName = r.createdBy?.name || 'N/A';
        const createdAt = r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A';
        return `"${r.clientName}","${r.mobile}","${r.address}","${r.loanType}",${r.loanAmount},"${r.status}","${createdByName}","${createdAt}"`;
      })
      .join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=dh-financial-records.csv');
    res.send(csv);
  }

  @Get('export/excel')
  async exportExcel(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser() user,
    @Res() res: Response,
  ) {
    const records = await this.recordsService.getExportData(user, startDate, endDate);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Records');

    worksheet.columns = [
      { header: 'Client Name', key: 'clientName', width: 25 },
      { header: 'Mobile', key: 'mobile', width: 15 },
      { header: 'Address', key: 'address', width: 30 },
      { header: 'Loan Type', key: 'loanType', width: 15 },
      { header: 'Loan Amount', key: 'loanAmount', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Created By', key: 'createdBy', width: 20 },
      { header: 'Created At', key: 'createdAt', width: 15 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2D2B7F' },
    };

    records.forEach((r: any) => {
      worksheet.addRow({
        clientName: r.clientName,
        mobile: r.mobile,
        address: r.address,
        loanType: r.loanType,
        loanAmount: r.loanAmount,
        status: r.status,
        createdBy: r.createdBy?.name || 'N/A',
        createdAt: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A',
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=dh-financial-records.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user) {
    return this.recordsService.findOne(id, user);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRecordDto: UpdateRecordDto,
    @CurrentUser() user,
  ) {
    const record = await this.recordsService.update(id, updateRecordDto, user);
    return { message: 'Record updated successfully', record };
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user) {
    await this.recordsService.delete(id, user);
    return { message: 'Record deleted successfully' };
  }
}
