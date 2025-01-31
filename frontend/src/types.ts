export type Release = {
  target_binary_range: string;
  blob_url: string;
  is_disabled: boolean;
  is_mandatory: boolean;
  label: string;
  package_hash: string;
  released_by: string;
  release_method: string;
  rollout: number;
  size: number;
  upload_time: number;
  diff_package_map: Record<string, { size: number; url: string }>;
};
