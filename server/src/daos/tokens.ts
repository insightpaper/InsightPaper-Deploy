import {
  runStoredProcedure
} from "../services/databaseService";
import TokenInterface from "../interfaces/Token";

export default class TokenDao {
  /**
   * Funtion to create a token
   * @param tokenId
   * @returns
   */
  public static async createToken(tokenId: string): Promise<boolean> {
    const result = await runStoredProcedure(
      "SP_Tokens_CreateToken",
      {
        IN_tokenId: tokenId,
      }
    );

    return result[0].length > 0;
  }

  /**
   * Function to get a token by id
   * @param tokenId
   * @returns
   */
  public static async getTokenById(tokenId: string): Promise<TokenInterface> {
    const result = await runStoredProcedure("SP_Tokens_GetToken", {
      IN_tokenId: tokenId,
    });

    return result[0][0] as TokenInterface;
  }

  /**
   * Function to use a token
   * @param tokenId
   * @returns
   */
  public static async useToken(tokenId: string): Promise<boolean> {
    const result = await runStoredProcedure("SP_Tokens_UseToken", {
      IN_tokenId: tokenId,
    });

    return result[0].length > 0;
  }
}
