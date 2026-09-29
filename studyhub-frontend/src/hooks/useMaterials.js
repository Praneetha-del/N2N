import { useMaterials as useMaterialsContext } from '../context/MaterialContext';

export const useMaterials = () => {
  const materials = useMaterialsContext();
  return materials;
};