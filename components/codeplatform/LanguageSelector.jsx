import {
    Box,
    Button,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text,
} from "@chakra-ui/react";
import { LANGUAGE_VERSIONS } from "@/utils/codeplatform/constants";
import styles from "@/styles/codeplatform/display.module.css";

const languages = Object.entries(LANGUAGE_VERSIONS);
const ACTIVE_COLOR = "blue.400";

const LanguageSelector = ({
    language,
    onSelect,
}) => {
    return (
        <Box ml={2} mb={4}>
            <div className={styles.display}>
                <Text mb={2} fontSize="lg">
                    Language:
                </Text>
                <Menu isLazy>
                    <MenuButton as={Button}>{language}</MenuButton>
                    <MenuList bg="#110c1b">
                        {languages.map(([lang, version]) => (
                            <MenuItem
                                key={lang}
                                color={lang === language ? ACTIVE_COLOR : ""}
                                bg={lang === language ? "gray.900" : "transparent"}
                                _hover={{
                                    color: ACTIVE_COLOR,
                                    bg: "gray.900",
                                }}
                                onClick={() => onSelect(lang)}
                            >
                                {lang}
                                &nbsp;
                                <Text as="span" color="gray.600" fontSize="sm">
                                    {version}
                                </Text>
                            </MenuItem>
                        ))}
                    </MenuList>
                </Menu>
            </div>
        </Box>
    );
};

export default LanguageSelector;
