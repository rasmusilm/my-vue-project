import httpCLient from "@/http-client";
import { useIdentityStore } from "@/stores/identityStore";
import type { AxiosError } from "axios";
import { IdentityService } from "../IdentityService";
import type { IServiceResult } from "./IServiceResult";
import type {Post} from "@/domain/Post";

export class BaseService<TEntity> {
    identityStore = useIdentityStore();

    constructor(private path: string) {
    }

    async getAll(): Promise<TEntity[]> {
        console.log("getAll");
        try {
            let response = await httpCLient.get(`/${this.path}`, {
                headers: {
                    "Authorization": "bearer " + this.identityStore.$state.jwt?.token
                }
            });
            console.log(response);

            let res = response.data as TEntity[];
            return res;
        } catch (e) {
            let response = (e as AxiosError).response!;
            if (response.status == 401 && this.identityStore.jwt) {
                let identityService = new IdentityService();
                let refreshResponse = await identityService.refreshIdentity();
                this.identityStore.$state.jwt = refreshResponse.data!;

                if ( !this.identityStore.$state.jwt) return [];
                

                let response = await httpCLient.get(`/${this.path}`, {
                    headers: {
                        "Authorization": "bearer " + this.identityStore.$state.jwt?.token
                    }
                });
                console.log(response);
    
                let res = response.data as TEntity[];
                return res;

            }

        }


        return [];
    }

    async get(id: string): Promise<TEntity> {
        console.log("get");
        try {
            let response = await httpCLient.get(`/${this.path}/${id}`);
            console.log(response);
            let res = response.data as TEntity;
            return res;
        } catch (e) {
            let response = (e as AxiosError).response!;
            if (response.status == 401 && this.identityStore.jwt) {
                let identityService = new IdentityService();
                let refreshResponse = await identityService.refreshIdentity();
                this.identityStore.$state.jwt = refreshResponse.data!;

                if (!this.identityStore.$state.jwt) return null as unknown as TEntity;


                let response = await httpCLient.get(`/${this.path}/${id}`, {
                    headers: {
                        "Authorization": "bearer " + this.identityStore.$state.jwt?.token
                    }
                });
                console.log(response);

                let res = response.data as TEntity;
                return res;
            }
            return null as unknown as TEntity
        }
    }

    async add(entity: TEntity): Promise<IServiceResult<void>> {
        console.log("add");

        let response;
        try {
            response = await httpCLient.post(`/${this.path}`, entity,
                {
                    headers: {
                        "Authorization": "bearer " + this.identityStore.$state.jwt?.token
                    }
                }
            );
        } catch (e) {
            let res = {
                status: (e as AxiosError).response!.status,
                // @ts-ignore
                errorMsg: (e as AxiosError).response!.data.error,
            }
            console.log(res);
            return res;
        }

        return { status: response.status };
    }
}