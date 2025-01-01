export default {
  attrs: {
    allow: {
      create: 'false',
      delete: 'false',
      update: 'false',
    },
  },
  trip: {
    bind: [
      // TODO: Refactor permission model to use "roles"
      // TODO: Roles: 'viewer', 'participant', 'owner'
      'isTripViewer',
      "auth.email in data.ref('viewer.email')",
      'isTripEditor',
      "auth.email in data.ref('editor.email')",
      'isTripOwner',
      "auth.email in data.ref('owner.email')",
    ],
    allow: {
      view: 'isTripViewer || isTripEditor || isTripOwner',
      create: 'isTripOwner',
      delete: 'isTripOwner',
      update: 'isTripEditor || isTripOwner',
    },
  },
  user: {
    bind: ['isSelf', 'auth.email == data.email'],
    allow: {
      view: 'true',
      create: 'true',
      delete: 'false',
      update: 'isSelf',
    },
  },
  $users: {
    allow: {
      view: 'auth.id == data.id',
      create: 'false',
      delete: 'false',
      update: 'false',
    },
  },
  activity: {
    bind: [
      'isTripViewer',
      "auth.email in data.ref('trip.viewer.email')",
      'isTripEditor',
      "auth.email in data.ref('trip.editor.email')",
      'isTripOwner',
      "auth.email in data.ref('trip.owner.email')",
    ],
    allow: {
      view: 'isTripViewer || isTripEditor || isTripOwner',
      create: 'isTripEditor || isTripOwner',
      delete: 'isTripEditor || isTripOwner',
      update: 'isTripEditor || isTripOwner',
    },
  },
  accommodation: {
    bind: [
      'isTripViewer',
      "auth.email in data.ref('trip.viewer.email')",
      'isTripEditor',
      "auth.email in data.ref('trip.editor.email')",
      'isTripOwner',
      "auth.email in data.ref('trip.owner.email')",
    ],
    allow: {
      view: 'isTripViewer || isTripEditor || isTripOwner',
      create: 'isTripEditor || isTripOwner',
      delete: 'isTripEditor || isTripOwner',
      update: 'isTripEditor || isTripOwner',
    },
  },
  expense: {
    bind: [
      'isTripViewer',
      "auth.email in data.ref('trip.viewer.email')",
      'isTripEditor',
      "auth.email in data.ref('trip.editor.email')",
      'isTripOwner',
      "auth.email in data.ref('trip.owner.email')",
    ],
    allow: {
      view: 'isTripEditor || isTripOwner',
      create: 'isTripEditor || isTripOwner',
      delete: 'isTripEditor || isTripOwner',
      update: 'isTripEditor || isTripOwner',
    },
  },
};
