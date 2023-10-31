import { Interface } from 'ethers';
import { blurMarketplaceABI } from './blur-abi';
import { blurMarketplace2ABI } from './blur-abi-2';
import { blurMarketplace3ABI } from './blur-abi-3';

export const blurMarketplaceInterface = new Interface(blurMarketplaceABI);
export const blurMarketplace2Interface = new Interface(blurMarketplace2ABI);
export const blurMarketplace3Interface = new Interface(blurMarketplace3ABI);
