import { Service } from 'typedi';
import { PackageRepository } from '../repositories/PackageRepository';

@Service()
export class PackageService {
  constructor(private readonly packageRepo: PackageRepository) {}

  async getPackageByIds(ids: string[]): Promise<Record<string, any>> {
    return this.packageRepo.getPackageByIds(ids);
  }
}
