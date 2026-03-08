import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Record, RecordDocument } from './schemas/record.schema';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { QueryRecordDto } from './dto/query-record.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class RecordsService {
  constructor(
    @InjectModel(Record.name) private recordModel: Model<RecordDocument>,
  ) {}

  async create(createRecordDto: CreateRecordDto, userId: string): Promise<RecordDocument> {
    const record = new this.recordModel({
      ...createRecordDto,
      createdBy: userId,
    });
    return (await record.save()).populate('createdBy', 'name email');
  }

  async findAll(query: QueryRecordDto, user: any) {
    const { search, loanType, status, startDate, endDate, page = '1', limit = '10' } = query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};

    // Team members can only see their own records
    if (user.role === Role.TEAM_MEMBER) {
      filter.createdBy = user.id;
    }

    if (loanType) filter.loanType = loanType;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }
    if (search) {
      filter.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const [records, total] = await Promise.all([
      this.recordModel
        .find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .exec(),
      this.recordModel.countDocuments(filter),
    ]);

    return {
      records,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async findOne(id: string, user: any): Promise<RecordDocument> {
    const record = await this.recordModel
      .findById(id)
      .populate('createdBy', 'name email')
      .exec();

    if (!record) {
      throw new NotFoundException('Record not found');
    }

    if (user.role === Role.TEAM_MEMBER && record.createdBy._id.toString() !== user.id.toString()) {
      throw new ForbiddenException('You can only view your own records');
    }

    return record;
  }

  async update(id: string, updateRecordDto: UpdateRecordDto, user: any): Promise<RecordDocument> {
    const record = await this.recordModel.findById(id);
    if (!record) {
      throw new NotFoundException('Record not found');
    }

    if (user.role === Role.TEAM_MEMBER && record.createdBy.toString() !== user.id.toString()) {
      throw new ForbiddenException('You can only edit your own records');
    }

    Object.assign(record, updateRecordDto);
    return (await record.save()).populate('createdBy', 'name email');
  }

  async delete(id: string, user: any): Promise<void> {
    const record = await this.recordModel.findById(id);
    if (!record) {
      throw new NotFoundException('Record not found');
    }

    if (user.role === Role.TEAM_MEMBER) {
      throw new ForbiddenException('Only admin can delete records');
    }

    await this.recordModel.findByIdAndDelete(id);
  }

  async getExportData(user: any, startDate?: string, endDate?: string) {
    const filter: any = {};
    if (user.role === Role.TEAM_MEMBER) {
      filter.createdBy = user.id;
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    return this.recordModel
      .find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }
}
