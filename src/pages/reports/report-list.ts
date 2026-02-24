//report-list.ts
export const envConfig: any = {
  dev: {
    groupId: '7a64a3bc-7443-48be-a65b-c8c958b5d907',
    reports: [
      {
        id: 'e7d881b7-3e81-4b23-bdf6-afd321f79308',
        name: 'Unassigned Vehicles',
        description: 'List of Vehicles unassigned to devices.',
        exportReports: [
          {
            reportId: '6dd24ab6-8b6b-472a-a06f-4f0f13498208',
            datasetId: 'b039992b-9d6c-49b0-873e-1984d967b256',
            isPaginated: true,
          },
        ],
      },
      {
        id: '176351c1-6d91-435b-ae2d-56dddbba0ea4',
        name: 'Unassigned Devices',
        description: 'List of devices unassigned to vehicles.',
        exportReports: [
          {
            reportId: '89ee7fe2-7bea-4e5a-9c3f-33932fd6b5ce',
            datasetId: 'b039992b-9d6c-49b0-873e-1984d967b256',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'd19d6044-b07b-4467-b39b-a1357e31cc33',
        name: 'Incomplete Trips',
        description: 'Trips without associated driver or vehicle data.',
        exportReports: [
          {
            reportId: '1458d4f5-fc00-40cf-ac52-0bc9d55f29d5',
            datasetId: 'b039992b-9d6c-49b0-873e-1984d967b256',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'b74f2355-f1f7-4def-bf75-74ac67931ee1',
        name: 'Ongoing Trips',
        description: 'Trips with associated driver or vehicle data.',
        exportReports: [
          {
            reportId: '335cd762-9070-4885-b0d5-d8c113e127fc',
            datasetId: 'b039992b-9d6c-49b0-873e-1984d967b256',
            isPaginated: true,
          },
        ],
      },
    ],
  },
  qa: {
    groupId: '7a64a3bc-7443-48be-a65b-c8c958b5d907',
    reports: [
      {
        id: '1354e189-7642-4960-89be-ca929317d5fd',
        name: 'Unassigned Vehicles',
        description: 'List of Vehicles unassigned to devices.',
        exportReports: [
          {
            reportId: 'f72aaa7d-1db4-4789-bfe8-3117337a4eff',
            datasetId: '331febe9-db5f-44b0-b2bb-25afbc339fe7',
            isPaginated: true,
          },
        ],
      },
      {
        id: '352cc4b9-cf9d-402f-8ec8-3407321c736e',
        name: 'Unassigned Devices',
        description: 'List of devices unassigned to vehicles.',
        exportReports: [
          {
            reportId: 'c762b735-da0d-47cc-8a2d-3f8d654eff9f',
            datasetId: '331febe9-db5f-44b0-b2bb-25afbc339fe7',
            isPaginated: true,
          },
        ],
      },
      {
        id: '71c7a67c-3ec9-4561-b800-d80b0df61ce0',
        name: 'Incomplete Trips',
        description: 'Trips without associated driver or vehicle data.',
        exportReports: [
          {
            reportId: '58d152f7-4b2b-48ad-87b7-9a6d4dabc113',
            datasetId: '331febe9-db5f-44b0-b2bb-25afbc339fe7',
            isPaginated: true,
          },
        ],
      },
      {
        id: '5a5432af-45d2-4e39-92b4-0ba4c15f09b3',
        name: 'Ongoing Trips',
        description: 'Trips with associated driver or vehicle data.',
        exportReports: [
          {
            reportId: '61dc9311-5309-4900-a4d7-e28060dd8c25',
            datasetId: '331febe9-db5f-44b0-b2bb-25afbc339fe7',
            isPaginated: true,
          },
        ],
      },
    ],
  },
  preproduction: {
    groupId: '7a64a3bc-7443-48be-a65b-c8c958b5d907',
    reports: [
      {
        id: 'daeb8e27-f692-4a45-b3eb-ced9702d1cdc',
        name: 'Unassigned Vehicles',
        description: 'List of Vehicles unassigned to devices.',
        exportReports: [
          {
            reportId: 'cd219b74-0bf7-40a8-8dc7-71efd324b313',
            datasetId: '5d3cdafc-acf6-4847-a120-3b078630b084',
            isPaginated: true,
          },
        ],
      },
      {
        id: '8735d992-cbf2-4620-ab10-4d2ea7dc2d48',
        name: 'Unassigned Devices',
        description: 'List of devices unassigned to vehicles.',
        exportReports: [
          {
            reportId: 'aef3b53d-1542-4504-9262-f237a8482dc9',
            datasetId: '5d3cdafc-acf6-4847-a120-3b078630b084',
            isPaginated: true,
          },
        ],
      },
      {
        id: '77345bd0-01d2-4ce2-af3c-a030c1df9c2a',
        name: 'Incomplete Trips',
        description: 'Trips without associated driver or vehicle data.',
        exportReports: [
          {
            reportId: 'd3f176af-4b96-4e8b-893d-3e6910dee374',
            datasetId: '5d3cdafc-acf6-4847-a120-3b078630b084',
            isPaginated: true,
          },
        ],
      },
      {
        id: '8b691448-7c9c-461c-adb7-c6c9f4acba7f',
        name: 'Ongoing Trips',
        description: 'Trips with associated driver or vehicle data.',
        exportReports: [
          {
            reportId: '4939d817-fb0a-4702-88d5-a1128941e6d1',
            datasetId: '5d3cdafc-acf6-4847-a120-3b078630b084',
            isPaginated: true,
          },
        ],
      },
    ],
  },
  prod: {
    groupId: '7a64a3bc-7443-48be-a65b-c8c958b5d907',
    reports: [
      {
        id: 'cd00a961-25dd-419c-aa6c-91579c2cdba5',
        name: 'Unassigned Vehicles',
        description: 'List of Vehicles unassigned to devices.',
        exportReports: [
          {
            reportId: 'de4c689d-c2fd-41ac-adc4-49b9ba93c0af',
            datasetId: '89b1b944-c759-43d9-9785-d25ae49eacf8',
            isPaginated: true,
          },
        ],
      },
      {
        id: '5d6584c7-37f5-4f97-a7a4-427bdbfde258',
        name: 'Unassigned Devices',
        description: 'List of devices unassigned to vehicles.',
        exportReports: [
          {
            reportId: '5601786f-51b8-40e2-b340-de67e98e6a74',
            datasetId: '89b1b944-c759-43d9-9785-d25ae49eacf8',
            isPaginated: true,
          },
        ],
      },
      {
        id: 'd8e4302b-31c5-47ef-b5e3-ecd53949e75c',
        name: 'Incomplete Trips',
        description: 'Trips without associated driver or vehicle data.',
        exportReports: [
          {
            reportId: '692c7eba-5eac-4961-b056-a86075c762f5',
            datasetId: '89b1b944-c759-43d9-9785-d25ae49eacf8',
            isPaginated: true,
          },
        ],
      },
      {
        id: '4b9f5a36-bd6d-4ef5-bc3e-c4cb618f610f',
        name: 'Ongoing Trips',
        description: 'Trips with associated driver or vehicle data.',
        exportReports: [
          {
            reportId: 'a4712935-71f5-44d9-bb68-4c886584c79c',
            datasetId: '89b1b944-c759-43d9-9785-d25ae49eacf8',
            isPaginated: true,
          },
        ],
      },
    ],
  },
};
