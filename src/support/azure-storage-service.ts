import * as uuid from 'uuid';
import { BlobServiceClient, BlockBlobClient } from '@azure/storage-blob';
import { config } from './config';

export default class AzureStorageService {
  private static connectionString = config.azure.storage.AZURE_STORAGE_CONNECTION_STRING;
  private static inboundContainerName = config.azure.storage.INBOUND_CONTAINER_NAME;

  private static async uploadBlobToContainer(
    filePath: string,
    containerName: string,
  ): Promise<string> {
    console.log('Uploading to blob container', containerName);
    const blobServiceClient = BlobServiceClient.fromConnectionString(this.connectionString);

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const storageId = uuid.v4();

    const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(storageId);
    const result = await blockBlobClient.uploadFile(filePath);
    console.log('Blob uploaded with storage ID', storageId, result);
    return storageId;
  }

  public static async uploadBlobToInbound(filePath: string): Promise<string> {
    return await this.uploadBlobToContainer(filePath, this.inboundContainerName);
  }
}
