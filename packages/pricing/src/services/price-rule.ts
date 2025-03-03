import { Context, DAL, FindConfig } from "@medusajs/types"
import {
  InjectManager,
  InjectTransactionManager,
  MedusaContext,
  ModulesSdkUtils,
  retrieveEntity,
} from "@medusajs/utils"
import { PriceRule } from "@models"
import { PriceRuleRepository } from "@repositories"

import { ServiceTypes } from "@types"

type InjectedDependencies = {
  priceRuleRepository: DAL.RepositoryService
}

export default class PriceRuleService<TEntity extends PriceRule = PriceRule> {
  protected readonly priceRuleRepository_: DAL.RepositoryService

  constructor({ priceRuleRepository }: InjectedDependencies) {
    this.priceRuleRepository_ = priceRuleRepository
  }

  @InjectManager("priceRuleRepository_")
  async retrieve(
    priceRuleId: string,
    config: FindConfig<ServiceTypes.PriceRuleDTO> = {},
    @MedusaContext() sharedContext: Context = {}
  ): Promise<TEntity> {
    return (await retrieveEntity<PriceRule, ServiceTypes.PriceRuleDTO>({
      id: priceRuleId,
      entityName: PriceRule.name,
      repository: this.priceRuleRepository_,
      config,
      sharedContext,
    })) as TEntity
  }

  @InjectManager("priceRuleRepository_")
  async list(
    filters: ServiceTypes.FilterablePriceRuleProps = {},
    config: FindConfig<ServiceTypes.PriceRuleDTO> = {},
    @MedusaContext() sharedContext: Context = {}
  ): Promise<TEntity[]> {
    const queryConfig = ModulesSdkUtils.buildQuery<PriceRule>(filters, config)

    return (await this.priceRuleRepository_.find(
      queryConfig,
      sharedContext
    )) as TEntity[]
  }

  @InjectManager("priceRuleRepository_")
  async listAndCount(
    filters: ServiceTypes.FilterablePriceRuleProps = {},
    config: FindConfig<ServiceTypes.PriceRuleDTO> = {},
    @MedusaContext() sharedContext: Context = {}
  ): Promise<[TEntity[], number]> {
    const queryConfig = ModulesSdkUtils.buildQuery<PriceRule>(filters, config)

    return (await this.priceRuleRepository_.findAndCount(
      queryConfig,
      sharedContext
    )) as [TEntity[], number]
  }

  @InjectTransactionManager("priceRuleRepository_")
  async create(
    data: ServiceTypes.CreatePriceRuleDTO[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<TEntity[]> {
    return (await (this.priceRuleRepository_ as PriceRuleRepository).create(
      data,
      sharedContext
    )) as TEntity[]
  }

  @InjectTransactionManager("priceRuleRepository_")
  async update(
    data: ServiceTypes.UpdatePriceRuleDTO[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<TEntity[]> {
    return (await (this.priceRuleRepository_ as PriceRuleRepository).update(
      data,
      sharedContext
    )) as TEntity[]
  }

  @InjectTransactionManager("priceRuleRepository_")
  async delete(
    ids: string[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<void> {
    await this.priceRuleRepository_.delete(ids, sharedContext)
  }
}
