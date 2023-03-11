import {
  Box,
  Button,
  MantineProvider,
  Select,
  Stack,
  Text,
} from "@mantine/core";

import { DataTable } from "mantine-datatable";
import { Notifications } from "@mantine/notifications";
import React from "react";

type ListResult<T> = {
  items: T[];
  count: number;
};
type User = { id: string; name: string };
type Item = { id: string; name: string };
type ItemTemplate = { id: string; name: string };

type Stored = {
  logged?: boolean;
  users?: ListResult<User>;
  user?: User;
  items?: ListResult<Item>;
  item?: Item;
  itemTemplates?: ListResult<ItemTemplate>;
  itemTemplate?: ItemTemplate;
};

const store = (function () {
  let stored: Stored = {};
  let listeners: (() => void)[] = [];
  function getSnapshot() {
    return stored;
  }
  function subscribe(listener: () => void) {
    listeners = listeners.concat(listener);
    return function () {
      listeners = listeners.filter((each) => each !== listener);
    };
  }
  function emitChanges() {
    listeners.forEach((each) => each());
  }
  function updateSnapshot(delta: Partial<Stored>) {
    stored = { ...stored, ...delta };
    emitChanges();
  }
  return { getSnapshot, updateSnapshot, subscribe, emitChanges };
})();

type Store = typeof store;

function doOnChange<K extends keyof Stored>(
  key: K,
  onChange: (store: Store, value: NonNullable<Stored[K]>) => void
) {
  let previousValue: Stored[K] | undefined = undefined;
  return function () {
    const stored = store.getSnapshot();
    if (previousValue === stored[key]) {
      return;
    }
    previousValue = stored[key];
    if (stored[key]) {
      onChange(store, stored[key]!!);
    }
  };
}

store.subscribe(
  doOnChange("logged", (store) => {
    fetch("/users.json")
      .then((r) => r.json())
      .then((users) => {
        store.updateSnapshot({ users });
      });
  })
);
store.subscribe(
  doOnChange("user", (store, user) => {
    fetch(`/items.json?user=${user.id}`)
      .then((r) => r.json())
      .then((items) => {
        store.updateSnapshot({ items });
      });
  })
);
store.subscribe(
  doOnChange("user", (store, user) => {
    fetch(`/itemTemplates.json?user=${user.id}`)
      .then((r) => r.json())
      .then((itemTemplates) => {
        store.updateSnapshot({ itemTemplates });
      });
  })
);

function App() {
  const stored = React.useSyncExternalStore(store.subscribe, store.getSnapshot);
  console.info(stored);
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Notifications />
      <Box p="lg">
        <Stack>
          <Text size="xl">OPL</Text>
          {!stored.logged && (
            <Button onClick={() => store.updateSnapshot({ logged: true })}>
              로그인
            </Button>
          )}
          {stored.users && (
            <Select
              label="유저"
              data={stored.users.items.map((each) => each.name)}
              onChange={(name) =>
                store.updateSnapshot({
                  user: stored.users?.items.find((each) => each.name === name),
                })
              }
            />
          )}
          {stored.items && (
            <DataTable
              columns={Object.keys(stored.items.items[0]).map((accessor) => ({
                accessor,
              }))}
              records={stored.items.items}
            />
          )}
          {stored.itemTemplates && (
            <Select
              label="아이템"
              data={stored.itemTemplates.items.map((each) => each.name)}
              onChange={(name) =>
                store.updateSnapshot({
                  itemTemplate: stored.itemTemplates?.items.find(
                    (each) => each.name === name
                  ),
                })
              }
            />
          )}
          {stored.itemTemplate && (
            <Button
              onClick={() =>
                alert(`[${stored.itemTemplate?.name}]을 지급했습니다!`)
              }
            >
              지급
            </Button>
          )}
        </Stack>
      </Box>
    </MantineProvider>
  );
}

export default App;
