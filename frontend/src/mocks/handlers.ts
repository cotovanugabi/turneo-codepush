import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/releases", () => {
    return HttpResponse.json([
      {
        target_binary_range: ">=24.5.0",
        blob_url: "https://codepush.blob.core.windows.net/storagev2/",
        is_disabled: false,
        is_mandatory: true,
        label: "v141",
        package_hash: "hash",
        released_by: "app@gmail.com",
        release_method: "Upload",
        rollout: 100,
        size: 4026087,
        upload_time: 1725363546494,
        diff_package_map: {
          hash: {
            size: 1400879,
            url: "https://codepush.blob.core.windows.net/storagev2",
          },
          hash2: {
            size: 1400879,
            url: "https://codepush.blob.core.windows.net/storagev2/",
          },
          hash3: {
            size: 1400879,
            url: "https://codepush.blob.core.windows.net/storagev2/",
          },
          hash4: {
            size: 1400879,
            url: "https://codepush.blob.core.windows.net/storagev2/",
          },
          hash5: {
            size: 1400879,
            url: "https://codepush.blob.core.windows.net/storagev2/",
          },
        },
      },
      {
        target_binary_range: ">=24.5.0",
        blob_url: "https://codepush.blob.core.windows.net/storagev2/",
        is_disabled: false,
        is_mandatory: true,
        label: "v142",
        package_hash: "hash2",
        released_by: "app@gmail.com",
        release_method: "Upload",
        rollout: 100,
        size: 4026087,
        upload_time: 1725363546494,
        diff_package_map: {
          hash: {
            size: 1400879,
            url: "https://codepush.blob.core.windows.net/storagev2",
          },
        },
      },
      {
        target_binary_range: ">=24.5.0",
        blob_url: "https://codepush.blob.core.windows.net/storagev2/",
        is_disabled: false,
        is_mandatory: true,
        label: "v143",
        package_hash: "hash3",
        released_by: "app@gmail.com",
        release_method: "Upload",
        rollout: 100,
        size: 4026087,
        upload_time: 1725363546494,
        diff_package_map: {
          hash: {
            size: 1400879,
            url: "https://codepush.blob.core.windows.net/storagev2",
          },
          hash2: {
            size: 1400879,
            url: "https://codepush.blob.core.windows.net/storagev2/",
          },
          hash3: {
            size: 1400879,
            url: "https://codepush.blob.core.windows.net/storagev2/",
          },
        },
      },
      {
        target_binary_range: ">=24.5.0",
        blob_url: "https://codepush.blob.core.windows.net/storagev2/",
        is_disabled: false,
        is_mandatory: true,
        label: "v144",
        package_hash: "hash4",
        released_by: "app@gmail.com",
        release_method: "Upload",
        rollout: 100,
        size: 4026087,
        upload_time: 1725363546494,
        diff_package_map: {
          hash: {
            size: 1400879,
            url: "https://codepush.blob.core.windows.net/storagev2",
          },
          hash2: {
            size: 1400879,
            url: "https://codepush.blob.core.windows.net/storagev2/",
          },
          hash3: {
            size: 1400879,
            url: "https://codepush.blob.core.windows.net/storagev2/",
          },
          hash4: {
            size: 1400879,
            url: "https://codepush.blob.core.windows.net/storagev2/",
          },
        },
      },
    ]);
  }),
];
