import { runStoredProcedure } from "../services/databaseService";
import { recordSetToJsonString } from "../utils/jsonParser";
import { ModelInterface } from "../interfaces/Models/Model";
export default class ModelDao {
  /**
   * Function to get all the models information
   * @param currentUserId Current user ID
   * @returns Boolean
   */
  public static async getModels(
    currentUserId: string | undefined
  ): Promise<ModelInterface[]> {
    const result = await runStoredProcedure("SP_Models_GetModels", {
      IN_currentUserId: currentUserId,
    });

    const jsonString = recordSetToJsonString(result);

    if (!jsonString || jsonString.trim() === "") {
      return [];
    }

    const parsedResult = JSON.parse(jsonString) as ModelInterface[];

    return parsedResult;
  }
}
