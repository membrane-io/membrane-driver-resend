// `nodes` contain any nodes you add from the graph (dependencies)
// `root` is a reference to this program's root node
// `state` is an object that persists across program updates. Store data here.
import { state, root } from "membrane";

export function status() {
  if (!state.apiKey) {
    return "Please [get an Resend API Key](https://resend.com/api-keys) and [configure](:configure) it.";
  } else {
    return `Ready`;
  }
}

export async function configure({ apiKey }) {
  state.apiKey = apiKey ?? state.apiKey;
}

export const Root = {
  domains: () => ({})
};

export const Emails = {
  send: async (args) => {
    return await api("POST", "emails", args);
  },
};

export const DomainCollection = {
  one: async ({ id }) => {
    return await api("GET", `domains/${id}`);
  },
  page: async () => {
    const res = await api("GET", "domains");
    return {
      items: res.data,
      next: null,
    };
  },
  add: async ({ name }) => {
    return await api("POST", "domains", { name });
  },
};

export const Domain = {
  delete: async (_, { self }) => {
    const { id } = self.$argsAt(root.domains.one);
    return await api("DELETE", `domains/${id}`);     
  },
  verify: async (_, { self }) => {
    const { id } = self.$argsAt(root.domains.one);
    return await api("POST", `domains/${id}/verify`); 
  },
};

async function api(method: string, path: string, body?: any) {
  const response: any = await fetch(`https://api.resend.com/${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ${state.apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return await response.json();
}
