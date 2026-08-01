import nextConfig from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      // Regla pensada para código optimizado con React Compiler (no usado
      // aquí). Marca como error el patrón estándar "cargar datos al montar"
      // (useEffect -> función async -> setState tras un await), que es
      // seguro y es el idiom habitual de fetch-on-mount en este proyecto.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  { ignores: ['.next/**', 'node_modules/**', 'scripts/seed-data.json'] },
];

export default eslintConfig;
