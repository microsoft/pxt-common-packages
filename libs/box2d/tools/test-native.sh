#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p built/tests
mapfile -t sources < <(find vendor/box2d-2.4.1/src -name '*.cpp' -print | sort)
read -r -a flags <<< "${CXXFLAGS:-}"
"${CXX:-g++}" -std=c++11 -Wall -Wextra -Werror -O1 -g "${flags[@]}" \
    -Itests -c tests/native-tests.cpp -o built/tests/native-tests.o
"${CXX:-g++}" -std=c++11 -O1 -g "${flags[@]}" \
    built/tests/native-tests.o "${sources[@]}" -o built/tests/native-tests
built/tests/native-tests
