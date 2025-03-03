import { WorkflowArguments } from "@medusajs/workflows-sdk"
import { MedusaV2Flag, promiseAll } from "@medusajs/utils"
import { Modules } from "@medusajs/modules-sdk"

type ProductHandle = string
type SalesChannelId = string
type PartialProduct = { handle: string; id: string }
type HandlerInput = {
  productsHandleSalesChannelsMap: Map<ProductHandle, SalesChannelId[]>
  products: PartialProduct[]
}

export async function detachSalesChannelFromProducts({
  container,
  context,
  data,
}: WorkflowArguments<HandlerInput>): Promise<void> {
  const { manager } = context
  const featureFlagRouter = container.resolve("featureFlagRouter")

  const productsHandleSalesChannelsMap = data.productsHandleSalesChannelsMap
  const products = data.products

  const salesChannelService = container.resolve("salesChannelService")
  const salesChannelServiceTx = salesChannelService.withTransaction(manager)

  const salesChannelIdProductIdsMap = new Map<ProductHandle, SalesChannelId[]>()
  products.forEach((product) => {
    const salesChannelIds = productsHandleSalesChannelsMap.get(product.handle!)
    if (salesChannelIds) {
      salesChannelIds.forEach((salesChannelId) => {
        const productIds = salesChannelIdProductIdsMap.get(salesChannelId) || []
        productIds.push(product.id)
        salesChannelIdProductIdsMap.set(salesChannelId, productIds)
      })
    }
  })

  if (featureFlagRouter.isFeatureEnabled(MedusaV2Flag.key)) {
    const remoteLink = container.resolve("remoteLink")

    for (const [
      salesChannelId,
      productIds,
    ] of salesChannelIdProductIdsMap.entries()) {
      await promiseAll(
        productIds.map((id) =>
          remoteLink.dismiss({
            [Modules.PRODUCT]: {
              product_id: id,
            },
            salesChannelService: {
              sales_channel_id: salesChannelId,
            },
          })
        )
      )
    }
  } else {
    await promiseAll(
      Array.from(salesChannelIdProductIdsMap.entries()).map(
        async ([salesChannelId, productIds]) => {
          return await salesChannelServiceTx.removeProducts(
            salesChannelId,
            productIds
          )
        }
      )
    )
  }
}

detachSalesChannelFromProducts.aliases = {
  products: "products",
}
